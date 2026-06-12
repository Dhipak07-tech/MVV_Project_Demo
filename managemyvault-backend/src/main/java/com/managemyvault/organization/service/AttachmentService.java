package com.managemyvault.organization.service;

import com.managemyvault.common.exception.ResourceNotFoundException;
import com.managemyvault.organization.domain.Attachment;
import com.managemyvault.organization.repository.AttachmentRepository;
import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final MinioClient minioClient;
    private final String minioBucketName;
    private final ActivityEventService activityEventService;

    @Transactional
    public Attachment uploadAttachment(UUID orgId, String entityType, UUID entityId, MultipartFile file, UUID userId) {
        String originalFileName = file.getOriginalFilename();
        String contentType = file.getContentType();
        long size = file.getSize();

        // Generate a unique object key in MinIO
        String objectKey = String.format("orgs/%s/%s/%s/%s-%s", 
                orgId, entityType, entityId, UUID.randomUUID(), originalFileName);

        try (InputStream is = file.getInputStream()) {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(minioBucketName)
                            .object(objectKey)
                            .stream(is, size, -1)
                            .contentType(contentType)
                            .build()
            );
            log.info("Uploaded attachment file to MinIO object key: {}", objectKey);
        } catch (Exception e) {
            log.error("Failed to upload file to MinIO: {}", e.getMessage(), e);
            throw new RuntimeException("MinIO upload failed: " + e.getMessage(), e);
        }

        Attachment attachment = Attachment.builder()
                .organizationId(orgId)
                .entityType(entityType)
                .entityId(entityId)
                .fileName(originalFileName)
                .contentType(contentType)
                .size(size)
                .objectKey(objectKey)
                .build();
        attachment.setCreatedBy(userId);

        Attachment saved = attachmentRepository.save(attachment);

        activityEventService.logEvent(orgId, entityType, entityId, "ATTACHMENT_UPLOAD", userId);

        return saved;
    }

    @Transactional(readOnly = true)
    public List<Attachment> getAttachmentsForEntity(String entityType, UUID entityId) {
        return attachmentRepository.findByEntityTypeAndEntityId(entityType, entityId);
    }

    @Transactional(readOnly = true)
    public Attachment getAttachmentById(UUID id) {
        return attachmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment", id.toString()));
    }

    @Transactional
    public void deleteAttachment(UUID id, UUID userId) {
        Attachment attachment = getAttachmentById(id);

        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(minioBucketName)
                            .object(attachment.getObjectKey())
                            .build()
            );
            log.info("Deleted attachment file from MinIO object key: {}", attachment.getObjectKey());
        } catch (Exception e) {
            log.warn("Failed to delete object from MinIO key: {}. Maybe already deleted? {}", 
                    attachment.getObjectKey(), e.getMessage());
        }

        attachmentRepository.delete(attachment);
        activityEventService.logEvent(attachment.getOrganizationId(), 
                attachment.getEntityType(), attachment.getEntityId(), "ATTACHMENT_DELETE", userId);
    }

    public InputStream downloadAttachmentContent(UUID id) {
        Attachment attachment = getAttachmentById(id);
        try {
            return minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(minioBucketName)
                            .object(attachment.getObjectKey())
                            .build()
            );
        } catch (Exception e) {
            log.error("Failed to download file from MinIO for key: {}", attachment.getObjectKey(), e);
            throw new RuntimeException("MinIO download failed: " + e.getMessage(), e);
        }
    }
}
