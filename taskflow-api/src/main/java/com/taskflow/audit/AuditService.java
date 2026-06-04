package com.taskflow.audit;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AuditService {

	private final AuditLogRepository auditLogRepository;

	public AuditLog record(String action, String entityType, UUID projectId, UUID entityId, String actorEmail, String details) {
		AuditLog auditLog = AuditLog.builder()
			.action(action)
			.entityType(entityType)
			.projectId(projectId)
			.entityId(entityId)
			.actorEmail(actorEmail)
			.details(details)
			.build();
		return auditLogRepository.save(auditLog);
	}

	@Transactional(readOnly = true)
	public Page<AuditLog> findByProjectId(UUID projectId, Pageable pageable) {
		return auditLogRepository.findByProjectIdOrderByCreatedAtDesc(projectId, pageable);
	}
}
