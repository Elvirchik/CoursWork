package Proj.laba.model;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "products")
@Schema(description = "Сущность продукта")
public class Product extends GenericModel {

    @NotNull(message = "Название продукта не может быть пустым")
    @Size(min = 2, max = 100, message = "Название продукта должно содержать от 2 до 100 символов")
    @Column(name = "product_name", nullable = false)
    @Schema(description = "Название продукта", example = "Компик")
    private String productName;

    @NotNull(message = "Цена не может быть пустой")
    @DecimalMin(value = "0.0", inclusive = false, message = "Цена должна быть больше 0")
    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    @Schema(description = "Цена продукта", example = "100000")
    private BigDecimal price;

    @Column(name = "created_at")
    @Schema(description = "Временная метка создания")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @Schema(description = "Временная метка последнего обновления")
    private LocalDateTime updatedAt;

    @Lob
    @Column(name = "image")
    @Schema(description = "Изображение продукта")
    private byte[] image;

    @Schema(description = "Видеокарта")
    @Column(name = "video_card")
    private String videoCard;

    @Schema(description = "Процессор")
    @Column(name = "processor")
    private String processor;

    @Schema(description = "Оперативная память")
    @Column(name = "ram")
    private String ram;

    @Schema(description = "Постоянная память")
    @Column(name = "storage")
    private String storage;

    @Schema(description = "Количество товара на складе")
    @Column(name = "stock_quantity")
    private Integer stockQuantity;



}
