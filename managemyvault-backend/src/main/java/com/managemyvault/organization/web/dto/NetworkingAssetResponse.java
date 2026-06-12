package com.managemyvault.organization.web.dto;

import com.managemyvault.organization.domain.NetworkingAsset;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class NetworkingAssetResponse {

    private UUID id;
    private UUID organizationId;
    private String name;
    private String type;
    private String subnetCidr;
    private String gateway;
    private String vlanId;
    private String details;
    private Instant createdAt;
    private Instant updatedAt;
    private UUID createdBy;

    public static NetworkingAssetResponse from(NetworkingAsset asset) {
        return NetworkingAssetResponse.builder()
                .id(asset.getId())
                .organizationId(asset.getOrganizationId())
                .name(asset.getName())
                .type(asset.getType())
                .subnetCidr(asset.getSubnetCidr())
                .gateway(asset.getGateway())
                .vlanId(asset.getVlanId())
                .details(asset.getDetails())
                .createdAt(asset.getCreatedAt())
                .updatedAt(asset.getUpdatedAt())
                .createdBy(asset.getCreatedBy())
                .build();
    }
}
