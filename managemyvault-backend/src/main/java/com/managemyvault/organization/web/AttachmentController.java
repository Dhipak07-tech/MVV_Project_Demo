package com.managemyvault.organization.web;

import com.managemyvault.common.security.CurrentUser;
import com.managemyvault.common.security.OrgAccessControl;
import com.managemyvault.common.security.UserPrincipal;
import com.managemyvault.organization.domain.Attachment;
import com.managemyvault.organization.service.AttachmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/attachments")
@RequiredArgsConstructor
@Validated
public class AttachmentController {

    private final AttachmentService attachmentService;
    private final OrgAccessControl orgAccessControl;

    @PostMapping("/upload")
    public ResponseEntity<Attachment> upload(
            @RequestParam("organizationId") UUID organizationId,
            @RequestParam("entityType") String entityType,
            @RequestParam("entityId") UUID entityId,
            @RequestParam("file") MultipartFile file,
            @CurrentUser UserPrincipal currentUser) {
        if (!orgAccessControl.canAccess(organizationId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        Attachment uploaded = attachmentService.uploadAttachment(
                organizationId, entityType, entityId, file, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(uploaded);
    }

    @GetMapping("/{entityType}/{entityId}")
    public ResponseEntity<List<Attachment>> list(
            @PathVariable("entityType") String entityType,
            @PathVariable("entityId") UUID entityId,
            @RequestParam("organizationId") UUID organizationId,
            @CurrentUser UserPrincipal currentUser) {
        if (!orgAccessControl.canAccess(organizationId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(attachmentService.getAttachmentsForEntity(entityType, entityId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable("id") UUID id,
            @CurrentUser UserPrincipal currentUser) {
        Attachment attachment = attachmentService.getAttachmentById(id);
        if (!orgAccessControl.canAccess(attachment.getOrganizationId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        attachmentService.deleteAttachment(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<InputStreamResource> download(@PathVariable("id") UUID id) {
        Attachment attachment = attachmentService.getAttachmentById(id);
        if (!orgAccessControl.canAccess(attachment.getOrganizationId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        InputStream is = attachmentService.downloadAttachmentContent(id);
        String encodedFilename = URLEncoder.encode(attachment.getFileName(), StandardCharsets.UTF_8)
                .replace("+", "%20");
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encodedFilename)
                .contentType(MediaType.parseMediaType(attachment.getContentType()))
                .body(new InputStreamResource(is));
    }
}
