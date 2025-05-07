package Proj.laba.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.Builder;

@Data
@Builder
@Schema(description = "Токен для сброса пароля")
public class PasswordResetTokenDTO {
    private String token;
    private String email;
}
