package com.managemyvault.organization.web.dto;

import com.managemyvault.organization.domain.Asset;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class AssetResponse {

    private UUID id;
    private UUID organizationId;
    private String name;
    private String type;
    private String ipAddress;
    private String macAddress;
    private String serialNumber;
    private String model;
    private String manufacturer;
    private String osVersion;
    private String status;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;
    private UUID createdBy;

    public static AssetResponse from(Asset asset) {
        return AssetResponse.builder()
                .id(asset.getId())
                .organizationId(asset.getOrganizationId())
                .name(asset.getName())
                .type(asset.getType())
                .ipAddress(asset.getIpAddress())
                .macAddress(asset.getMacAddress())
                .serialNumber(asset.getSerialNumber())
                .model(asset.getModel())
                .manufacturer(asset.getManufacturer())
                .osVersion(asset.getOsVersion())
                .status(asset.getStatus())
                .notes(asset.getNotes())
                .createdAt(asset.getCreatedAt())
                .updatedAt(asset.getUpdatedAt())
                .createdBy(asset.getCreatedBy())
                .build();
    }
}
