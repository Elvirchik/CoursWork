package Proj.laba.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "role")
@Schema(description = "Сущность роли пользователя")
public class Role extends GenericModel {

    @NotBlank(message = "Название роли не может быть пустым")
    @Size(min = 2, max = 50, message = "Название роли должно содержать от 2 до 50 символов")
    @Column(name = "title", nullable = false, unique = true)
    @Schema(description = "Название роли", example = "ADMIN")
    private String title;

    @Size(max = 255, message = "Описание не должно превышать 255 символов")
    @Column(name = "description")
    @Schema(description = "Описание роли", example = "Администратор системы")
    private String description;
}
