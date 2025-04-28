package Proj.laba.controller.rest;

import Proj.laba.dto.CartDTO;
import Proj.laba.mapper.CartMapper;
import Proj.laba.model.Cart;
import Proj.laba.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/carts")
@Tag(name = "Корзина", description = "Контроллер для работы с корзиной пользователя")
public class CartController extends GenericController<Cart, CartDTO> {

    private final CartService cartService;

    public CartController(CartService cartService, CartMapper cartMapper) { //  Добавлен CartMapper
        super(cartService, cartMapper); // Передача cartMapper в конструктор GenericController
        this.cartService = cartService;
    }

    @Operation(description = "Получить корзину пользователя")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CartDTO>> getUserCart(@PathVariable Long userId) {
        return ResponseEntity.ok(cartService.getUserCart(userId));
    }

    @Operation(description = "Добавить товар в корзину пользователя")
    @PostMapping("/user/{userId}/product/{productId}")
    public ResponseEntity<CartDTO> addToCart(
            @PathVariable Long userId,
            @PathVariable Long productId,
            @RequestBody CartDTO cartDTO) {
        cartDTO.setUserId(userId);
        cartDTO.setProductId(productId);
        return ResponseEntity.ok(cartService.create(cartDTO));
    }

    @Operation(description = "Удалить товары из корзины пользователя")
    @DeleteMapping("/user/{userId}")
    public ResponseEntity<Void> clearUserCart(@PathVariable Long userId) {
        cartService.clearUserCart(userId);
        return ResponseEntity.ok().build();
    }

    @Operation(description = "Удалить товар из корзины пользователя")
    @DeleteMapping("/user/{userId}/product/{productId}")
    public ResponseEntity<Void> deleteCartItem(
            @PathVariable Long userId,
            @PathVariable Long productId) {
        cartService.deleteCartItem(userId, productId);
        return ResponseEntity.ok().build();
    }
    @PutMapping("/user/{userId}/product/{productId}")
    public ResponseEntity<CartDTO> updateCartItemQuantity(
            @PathVariable Long userId,
            @PathVariable Long productId,
            @RequestBody CartDTO cartDTO) {

        cartDTO.setUserId(userId);
        cartDTO.setProductId(productId);
        CartDTO updatedCartItem = cartService.updateQuantity(cartDTO);
        return ResponseEntity.ok(updatedCartItem);
    }

}
