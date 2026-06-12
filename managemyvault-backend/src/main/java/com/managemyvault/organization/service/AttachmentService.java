package com.managemyvault.organization.service;

import com.managemyvault.common.exception.ResourceNotFoundException;
import com.managemyvault.organization.domain.Attachment;
import com.managemyvault.organization.repository.AttachmentRepository;
import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
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

    @PersistenceContext
    private EntityManager entityManager;

    private String resolveUserName(UUID userId) {
        if (userId == null) return "System";
        try {
            Object fullName = entityManager.createNativeQuery(
                    "SELECT full_name FROM platform_users WHERE id = :userId UNION ALL SELECT full_name FROM organization_members WHERE id = :userId")
                    .setParameter("userId", userId)
                    .getSingleResult();
            if (fullName != null) {
                return fullName.toString();
            }
        } catch (Exception e) {
            // ignore and fallback
        }
        return "Unknown User";
    }

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
        saved.setCreatedByUserName(resolveUserName(userId));

        activityEventService.logEvent(orgId, entityType, entityId, "ATTACHMENT_UPLOAD", userId, "Uploaded " + originalFileName);

        return saved;
    }

    @Transactional(readOnly = true)
    public List<Attachment> getAttachmentsForEntity(String entityType, UUID entityId) {
        List<Attachment> list = attachmentRepository.findByEntityTypeAndEntityId(entityType, entityId);
        list.forEach(a -> a.setCreatedByUserName(resolveUserName(a.getCreatedBy())));
        return list;
    }

    @Transactional(readOnly = true)
    public Attachment getAttachmentById(UUID id) {
        Attachment a = attachmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment", id.toString()));
        a.setCreatedByUserName(resolveUserName(a.getCreatedBy()));
        return a;
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
            log.error("Failed to delete object from MinIO key: {}", attachment.getObjectKey(), e);
            throw new RuntimeException("MinIO deletion failed, transaction rolled back: " + e.getMessage(), e);
        }

        attachmentRepository.delete(attachment);
        activityEventService.logEvent(attachment.getOrganizationId(), 
                attachment.getEntityType(), attachment.getEntityId(), "ATTACHMENT_DELETE", userId, "Deleted " + attachment.getFileName());
    }

    @Transactional
    public InputStream downloadAttachmentContent(UUID id, UUID userId) {
        Attachment attachment = getAttachmentById(id);
        
        // Log ATTACHMENT_DOWNLOAD event
        activityEventService.logEvent(attachment.getOrganizationId(), 
                attachment.getEntityType(), attachment.getEntityId(), "ATTACHMENT_DOWNLOAD", userId, "Downloaded " + attachment.getFileName());
        
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
