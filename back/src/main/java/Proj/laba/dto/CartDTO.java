package Proj.laba.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "DTO для корзины")
public class CartDTO extends GenericDTO {

    @NotNull(message = "ID пользователя должен быть указан")
    private Long userId;

    @NotNull(message = "ID продукта должен быть указан")
    private Long productId;

    @Min(1)
    private Integer quantity;

    private BigDecimal totalPrice;

    // Данные о продукте
    @Schema(description = "Название продукта", example = "Компик")
    private String productName;

    @Schema(description = "Цена продукта", example = "100000")
    private BigDecimal price;

    @Schema(description = "Изображение продукта")
    private byte[] image;

    @Schema(description = "Видеокарта")
    private String videoCard;

    @Schema(description = "Процессор")
    private String processor;

    @Schema(description = "Оперативная память")
    private String ram;

    @Schema(description = "Постоянная память")
    private String storage;
}
