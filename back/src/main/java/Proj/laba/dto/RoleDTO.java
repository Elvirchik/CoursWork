package Proj.laba.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@NoArgsConstructor
@Schema(description = "DTO для роли пользователя")
public class RoleDTO extends GenericDTO {

    @NotBlank(message = "Название роли не может быть пустым")
    @Size(min = 2, max = 50, message = "Название роли должно содержать от 2 до 50 символов")
    @Schema(description = "Название роли", example = "USER", required = true)
    private String title;

    @Size(max = 255, message = "Описание не должно превышать 255 символов")
    @Schema(description = "Описание роли", example = "Обычный пользователь")
    private String description;
}
