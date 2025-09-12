package com.globaltechnology.backend.security.dto;

import java.util.Set;

public record MeResponse(String username, Set<String> roles) {}
