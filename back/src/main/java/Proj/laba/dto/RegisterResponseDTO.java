package Proj.laba.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.Builder;

@Data
@Builder
@Schema(description = "Ответ на запрос регистрации")
public class RegisterResponseDTO {
    @Schema(description = "Статус операции", example = "true")
    private boolean success;

    @Schema(description = "Сообщение", example = "Пользователь успешно зарегистрирован")
    private String message;
}
