package com.managemyvault.search.domain;

import lombok.Getter;

@Getter
public class EntityEvent<T> {

    public enum Action {
        CREATE,
        UPDATE,
        DELETE
    }

    private final Action action;
    private final String entityId;
    private final String entityType;
    private final String organizationId;
    private final T entity;

    public EntityEvent(Action action, String entityId, String entityType, String organizationId, T entity) {
        this.action = action;
        this.entityId = entityId;
        this.entityType = entityType;
        this.organizationId = organizationId;
        this.entity = entity;
    }
}
