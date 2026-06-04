package com.taskflow.audit;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/audit")
@RequiredArgsConstructor
public class AuditController {

	private final AuditService auditService;

	@GetMapping
	@PreAuthorize("isAuthenticated()")
	public Page<AuditLog> listByProject(@PathVariable UUID projectId, Pageable pageable) {
		return auditService.findByProjectId(projectId, pageable);
	}
}
