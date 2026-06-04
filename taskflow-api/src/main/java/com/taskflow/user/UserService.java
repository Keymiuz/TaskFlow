package com.taskflow.user;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.taskflow.exception.ResourceNotFoundException;
import com.taskflow.user.dto.UpdateUserRequest;
import com.taskflow.user.dto.UserResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService implements UserDetailsService {

	private final UserRepository userRepository;

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		User user = userRepository.findByEmail(username.toLowerCase(Locale.ROOT))
			.orElseThrow(() -> new UsernameNotFoundException("User not found"));

		GrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + user.getRole().name());
		return org.springframework.security.core.userdetails.User
			.withUsername(user.getEmail())
			.password(user.getPassword())
			.authorities(authority)
			.accountLocked(false)
			.disabled(!user.isEnabled())
			.accountExpired(false)
			.credentialsExpired(false)
			.build();
	}

	@Transactional(readOnly = true)
	public List<UserResponse> listAll() {
		return userRepository.findAll().stream().map(UserResponse::from).toList();
	}

	@Transactional(readOnly = true)
	public UserResponse findByEmail(String email) {
		return UserResponse.from(getUserByEmail(email));
	}

	@Transactional(readOnly = true)
	public User findEntityByEmail(String email) {
		return getUserByEmail(email);
	}

	public UserResponse updateMe(String email, UpdateUserRequest request) {
		User user = getUserByEmail(email);
		user.setName(request.name());
		if (StringUtils.hasText(request.avatarUrl())) {
			user.setAvatarUrl(request.avatarUrl());
		}
		return UserResponse.from(userRepository.save(user));
	}

	public UserResponse updateRole(UUID userId, UserRole role) {
		User user = userRepository.findById(userId)
			.orElseThrow(() -> new ResourceNotFoundException("User with id '%s' not found".formatted(userId)));
		user.setRole(role);
		return UserResponse.from(userRepository.save(user));
	}

	private User getUserByEmail(String email) {
		return userRepository.findByEmail(email.toLowerCase(Locale.ROOT))
			.orElseThrow(() -> new ResourceNotFoundException("User with email '%s' not found".formatted(email)));
	}
}
