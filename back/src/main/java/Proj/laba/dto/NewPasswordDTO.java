package Proj.laba.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "DTO для обновления пароля")
public class NewPasswordDTO {
    @NotBlank(message = "Токен не может быть пустым")
    @Schema(description = "Токен для сброса пароля")
    private String token;

    @NotBlank(message = "Пароль не может быть пустым")
    @Size(min = 6, max = 100, message = "Пароль должен содержать от 6 до 100 символов")
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{6,}$",
            message = "Пароль должен содержать как минимум одну букву и одну цифру")
    @Schema(description = "Новый пароль пользователя", example = "newpass123")
    private String password;

    @NotBlank(message = "Подтверждение пароля не может быть пустым")
    @Schema(description = "Подтверждение нового пароля", example = "newpass123")
    private String confirmPassword;
}
