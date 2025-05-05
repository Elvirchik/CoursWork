package Proj.laba.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
public class OrderDTO extends GenericDTO {
    private Long userId;
    private List<OrderProductDTO> orderProducts;
    private BigDecimal totalAmount;
    private String deliveryAddress;
    private String status;
    private Integer quantity; // общее кол-во всех товаров в заказе
    private List<ProductDTO> products;

    // Добавляем поля для информации о заказчике
    private String customerFirstName;
    private String customerLastName;
    private String customerEmail;
    private String customerPhone;
}
