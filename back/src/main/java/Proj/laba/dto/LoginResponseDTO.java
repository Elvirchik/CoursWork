package Proj.laba.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.Builder;

@Data
@Builder
@Schema(description = "Ответ на запрос авторизации")
public class LoginResponseDTO {
    @Schema(description = "Статус авторизации", example = "true")
    private boolean status;

    @Schema(description = "Сообщение", example = "Успешная авторизация")
    private String message;
}
