package com.taskflow.config;

import java.util.Locale;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.taskflow.user.User;
import com.taskflow.user.UserRepository;
import com.taskflow.user.UserRole;

@Configuration
public class DataInitializer {

	@Bean
	@Profile("dev")
	public CommandLineRunner seedAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		return args -> {
			String email = "admin@taskflow.com".toLowerCase(Locale.ROOT);
			if (userRepository.existsByEmail(email)) {
				return;
			}

			User admin = User.builder()
				.name("TaskFlow Admin")
				.email(email)
				.password(passwordEncoder.encode("admin123"))
				.role(UserRole.ADMIN)
				.enabled(true)
				.build();

			userRepository.save(admin);
		};
	}
}
