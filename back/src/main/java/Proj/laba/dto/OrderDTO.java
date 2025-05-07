package Proj.laba.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

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

    /**
     * Получает количество указанного продукта в заказе
     * @param productId идентификатор продукта
     * @return количество продукта в заказе или 0, если продукт не найден
     */
    public int getProductQuantity(Long productId) {
        if (orderProducts == null || orderProducts.isEmpty()) {
            return 0;
        }

        return orderProducts.stream()
                .filter(op -> op.getProductId().equals(productId))
                .findFirst()
                .map(OrderProductDTO::getQuantity)
                .orElse(0);
    }

    /**
     * Преобразует список продуктов в карту для быстрого доступа по ID
     * @return карта продуктов, где ключ - ID продукта
     */
    public Map<Long, ProductDTO> getProductsMap() {
        if (products == null) {
            return Map.of();
        }
        return products.stream()
                .collect(Collectors.toMap(ProductDTO::getId, Function.identity()));
    }

    /**
     * Получает полную информацию о продукте по ID
     * @param productId идентификатор продукта
     * @return объект продукта или null, если продукт не найден
     */
    public ProductDTO getProductById(Long productId) {
        if (products == null) {
            return null;
        }

        return products.stream()
                .filter(p -> p.getId().equals(productId))
                .findFirst()
                .orElse(null);
    }
}
