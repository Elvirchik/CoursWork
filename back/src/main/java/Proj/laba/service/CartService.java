package Proj.laba.service;

import Proj.laba.dto.CartDTO;
import Proj.laba.mapper.CartMapper;
import Proj.laba.model.Cart;
import Proj.laba.model.Product;
import Proj.laba.model.User;
import Proj.laba.reposirory.CartRepository;
import Proj.laba.reposirory.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.webjars.NotFoundException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartService extends GenericService<Cart, CartDTO> {

    private final CartRepository cartRepository;
    private final CartMapper cartMapper;
    private final UserRepository userRepository;
    private final ProductService productService;

    public CartService(CartRepository cartRepository, CartMapper cartMapper, UserRepository userRepository, ProductService productService) {
        super(cartRepository, cartMapper);
        this.cartRepository = cartRepository;
        this.cartMapper = cartMapper;
        this.userRepository = userRepository;
        this.productService = productService;
    }

    public CartDTO updateQuantity(CartDTO cartDTO) {
        // Проверяем существование пользователя
        User user = userRepository.findById(cartDTO.getUserId())
                .orElseThrow(() -> new NotFoundException("User not found"));

        // Проверяем существование товара через метод findProductById
        Product product = productService.findProductById(cartDTO.getProductId());

        // Находим товар в корзине пользователя по userId и productId
        List<Cart> cartItems = cartRepository.findAllByUserId(cartDTO.getUserId());
        Optional<Cart> cartItemToUpdate = cartItems.stream()
                .filter(cartItem -> cartItem.getProduct().getId().equals(cartDTO.getProductId()))
                .findFirst();

        if (cartItemToUpdate.isPresent()) {
            // Если товар найден, обновляем количество
            Cart cart = cartItemToUpdate.get();
            cart.setQuantity(cartDTO.getQuantity()); //  Заменяем старое количество новым
            cart.setTotalPrice(product.getPrice().multiply(new BigDecimal(cartDTO.getQuantity()))); // Обновляем общую стоимость
            return cartMapper.toDTO(cartRepository.save(cart));
        } else {
            throw new NotFoundException("Product not found in cart");
        }
    }

    // Добавляем метод getUserCart
    @Transactional
    public List<CartDTO> getUserCart(Long userId) {
        // Проверяем существование пользователя
        User user = userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));

        // Получаем все товары в корзине пользователя
        List<Cart> userCart = cartRepository.findAllByUserId(userId);
        return userCart.stream()
                .map(cart -> {
                    CartDTO cartDTO = cartMapper.toDTO(cart);
                    Product product = cart.getProduct();
                    if (product != null) {
                        cartDTO.setProductName(product.getProductName());
                        cartDTO.setPrice(product.getPrice());
                        cartDTO.setImage(product.getImage());
                        cartDTO.setVideoCard(product.getVideoCard());
                        cartDTO.setProcessor(product.getProcessor());
                        cartDTO.setRam(product.getRam());
                        cartDTO.setStorage(product.getStorage());
                    }
                    return cartDTO;
                })
                .collect(Collectors.toList());
    }

    // Добавляем метод clearUserCart
    public void clearUserCart(Long userId) {
        // Проверяем существование пользователя
        userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));

        // Удаляем все товары из корзины пользователя
        cartRepository.deleteAllByUserId(userId);
    }

    public void deleteCartItem(Long userId, Long productId) {
        // Проверяем существование пользователя
        userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        // Находим товар в корзине пользователя по userId и productId
        List<Cart> cartItems = cartRepository.findAllByUserId(userId);
        Optional<Cart> cartItemToDelete = cartItems.stream()
                .filter(cartItem -> cartItem.getProduct().getId().equals(productId))
                .findFirst();

        // Удаляем товар из корзины, если он существует
        if (cartItemToDelete.isPresent()) {
            cartRepository.delete(cartItemToDelete.get());
        } else {
            throw new NotFoundException("Product not found in cart");
        }
    }

    @Override
    public CartDTO create(CartDTO cartDTO) {
        User user = userRepository.findById(cartDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        // Используем метод findProductById вместо getOne
        Product product;
        try {
            product = productService.findProductById(cartDTO.getProductId());
        } catch (Exception e) {
            System.out.println("Ошибка при получении продукта: " + e.getMessage());
            return null;
        }

        if (product == null) {
            // Если продукт не найден, возвращаем null
            return null;
        }

        // Проверяем, есть ли уже такой товар в корзине пользователя
        List<Cart> existingCartItems = cartRepository.findAllByUserId(cartDTO.getUserId());
        Optional<Cart> existingCartItem = existingCartItems.stream()
                .filter(cart -> cart.getProduct().getId().equals(cartDTO.getProductId()))
                .findFirst();

        if (existingCartItem.isPresent()) {
            // Если товар уже есть в корзине, увеличиваем количество
            Cart cart = existingCartItem.get();
            cart.setQuantity(cart.getQuantity() + cartDTO.getQuantity());
            cart.setTotalPrice(product.getPrice().multiply(new BigDecimal(cart.getQuantity())));
            return cartMapper.toDTO(cartRepository.save(cart));
        } else {
            // Если товара нет в корзине, создаем новую запись
            Cart cart = cartMapper.toEntity(cartDTO);
            cart.setUser(user);
            cart.setProduct(product);
            cart.setDateCreated(LocalDateTime.now());
            cart.setCreatedWhen(LocalDateTime.now());
            cart.setTotalPrice(product.getPrice().multiply(new BigDecimal(cartDTO.getQuantity())));
            return cartMapper.toDTO(cartRepository.save(cart));
        }
    }

    public List<Long> getProductIdsFromCart(Long userId) {
        List<Cart> cartItems = cartRepository.findAllByUserId(userId);
        return cartItems.stream()
                .map(cart -> cart.getProduct().getId())
                .collect(Collectors.toList());
    }

    public BigDecimal getTotalAmount(Long userId) {
        List<Cart> cartItems = cartRepository.findAllByUserId(userId);
        return cartItems.stream()
                .map(cart -> cart.getProduct().getPrice().multiply(new BigDecimal(cart.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
