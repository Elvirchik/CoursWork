package Proj.laba.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.Builder;

@Data
@Builder
@Schema(description = "Запрос на авторизацию")
public class LoginRequestDTO {
    @Schema(description = "Email пользователя", example = "user@example.com")
    private String email;

    @Schema(description = "Пароль пользователя", example = "password123")
    private String password;
}
