package Proj.laba.model;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
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
    @Schema(description = "Основное изображение продукта")
    private byte[] image;

    @Lob
    @Column(name = "additional_images", columnDefinition = "TEXT")
    @Convert(converter = ImageListConverter.class)
    @Schema(description = "Дополнительные изображения продукта")
    private List<byte[]> additionalImages = new ArrayList<>();

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

    // Новые поля с подробными характеристиками
    @Schema(description = "Подробная информация о процессоре")
    @Column(name = "cpu_full")
    private String cpufull;

    @Schema(description = "Подробная информация о видеокарте")
    @Column(name = "gpu_full")
    private String gpufull;

    @Schema(description = "Подробная информация об оперативной памяти")
    @Column(name = "ram_full")
    private String ramfull;

    @Schema(description = "Подробная информация о накопителе")
    @Column(name = "rom_full")
    private String romfull;

    @Schema(description = "Подробная информация о блоке питания")
    @Column(name = "power_full")
    private String powerfull;

    @Schema(description = "Подробная информация о корпусе")
    @Column(name = "case_full")
    private String casefull;

    @Schema(description = "Подробная информация об охлаждении процессора")
    @Column(name = "cooling_cpu")
    private String coolingCpu;

}
