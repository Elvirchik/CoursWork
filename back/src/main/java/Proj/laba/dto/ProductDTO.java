package Proj.laba.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "DTO продукта")
public class ProductDTO extends GenericDTO {

    @NotNull(message = "Название продукта не может быть пустым")
    @Size(min = 2, max = 100, message = "Название продукта должно содержать от 2 до 100 символов")
    @Schema(description = "Название продукта", example = "Компик")
    private String productName;

    @NotNull(message = "Цена не может быть пустой")
    @DecimalMin(value = "0.0", inclusive = false, message = "Цена должна быть больше 0")
    @Schema(description = "Цена продукта", example = "100000")
    private BigDecimal price;

    @Schema(description = "Временная метка создания")
    private LocalDateTime createdAt;

    @Schema(description = "Временная метка последнего обновления")
    private LocalDateTime updatedAt;

    @Schema(description = "Основное изображение продукта")
    private byte[] image;

    @Schema(description = "Дополнительные изображения продукта")
    private List<byte[]> additionalImages = new ArrayList<>();

    @Schema(description = "Видеокарта")
    private String videoCard;

    @Schema(description = "Процессор")
    private String processor;

    @Schema(description = "Оперативная память")
    private String ram;

    @Schema(description = "Постоянная память")
    private String storage;

    // Новые поля с подробными характеристиками
    @Schema(description = "Подробная информация о процессоре")
    private String cpufull;

    @Schema(description = "Подробная информация о видеокарте")
    private String gpufull;

    @Schema(description = "Подробная информация об оперативной памяти")
    private String ramfull;

    @Schema(description = "Подробная информация о накопителе")
    private String romfull;

    @Schema(description = "Подробная информация о блоке питания")
    private String powerfull;

    @Schema(description = "Подробная информация о корпусе")
    private String casefull;

    @Schema(description = "Подробная информация об охлаждении процессора")
    private String coolingCpu;
}
