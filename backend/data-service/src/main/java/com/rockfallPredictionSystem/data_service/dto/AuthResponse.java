package com.rockfallPredictionSystem.data_service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.rockfallPredictionSystem.data_service.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    @JsonProperty("access_token")
    private String accessToken;

    @JsonProperty("token_type")
    @Builder.Default
    private String tokenType = "Bearer";

    @JsonProperty("user_id")
    private Long userId;

    private String name;

    private String email;

    private Role role;

    @JsonProperty("expires_in")
    private Long expiresIn;
}

