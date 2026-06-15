package com.example.crms.security;

import com.example.crms.user.Role;

public record AuthResponse(String token, String name, String email, Role role) {
}
