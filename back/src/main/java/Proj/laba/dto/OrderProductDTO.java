package Proj.laba.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class OrderProductDTO {
    private Long productId;
    private int quantity;
}
