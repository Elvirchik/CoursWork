package Proj.laba.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "DTO для услуг")
public class ServicesDTO extends GenericDTO {

    @NotBlank(message = "Название услуги не может быть пустым")
    @Size(min = 2, max = 100, message = "Название услуги должно содержать от 2 до 100 символов")
    @Schema(description = "Название услуги", example = "Ремонт компьютера")
    private String serviceName;

    @Schema(description = "Временная метка создания")
    private LocalDateTime createdAt;

    @Schema(description = "Временная метка последнего обновления")
    private LocalDateTime updatedAt;

    @Schema(description = "Флаг удаления", example = "false")
    private Boolean deleted = false;
}
