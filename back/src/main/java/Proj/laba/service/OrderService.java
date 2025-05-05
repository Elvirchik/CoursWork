package Proj.laba.service;

import Proj.laba.dto.CartDTO;
import Proj.laba.dto.OrderDTO;
import Proj.laba.dto.ProductDTO;
import Proj.laba.dto.OrderProductDTO;
import Proj.laba.mapper.OrderMapper;
import Proj.laba.model.Order;
import Proj.laba.model.Product;
import Proj.laba.model.User;
import Proj.laba.model.OrderProducts;
import Proj.laba.reposirory.OrderRepository;
import Proj.laba.reposirory.ProductRepository;
import Proj.laba.reposirory.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.hibernate.Hibernate;

import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.Optional;

@Service
public class OrderService extends GenericService<Order, OrderDTO> {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ModelMapper modelMapper;
    private final CartService cartService; // Inject CartService

    public OrderService(OrderRepository orderRepository, OrderMapper orderMapper, UserRepository userRepository, ProductRepository productRepository, ModelMapper modelMapper, CartService cartService) { // Add CartService
        super(orderRepository, orderMapper);
        this.orderRepository = orderRepository;
        this.orderMapper = orderMapper;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.modelMapper = modelMapper;
        this.cartService = cartService; // Inject CartService
    }
    @Override
    public void delete(final Long id) {
        orderRepository.deleteById(id);
    }

    @Override
    @Transactional
    public OrderDTO create(OrderDTO orderDTO) {
        Order order = orderMapper.toEntity(orderDTO);

        User user = userRepository.findById(orderDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        order.setUser(user);

        // Get cart items
        List<CartDTO> cartItems = cartService.getUserCart(orderDTO.getUserId());

        // Create OrderProducts for each cart item
        List<OrderProducts> orderProducts = cartItems.stream()
                .map(cartItem -> {
                    Product product = productRepository.findById(cartItem.getProductId())
                            .orElseThrow(() -> new RuntimeException("Product not found: " + cartItem.getProductId()));

                    OrderProducts orderProduct = new OrderProducts();
                    orderProduct.setOrder(order);
                    orderProduct.setProduct(product);
                    orderProduct.setQuantity(cartItem.getQuantity());
                    return orderProduct;
                })
                .collect(Collectors.toList());

        order.setOrderProducts(orderProducts);

        // Calculate total quantity and total amount
        Integer totalQuantity = cartItems.stream()
                .map(CartDTO::getQuantity)
                .filter(Objects::nonNull)
                .reduce(0, Integer::sum);

        BigDecimal totalAmount = cartItems.stream()
                .map(cartItem -> cartItem.getPrice().multiply(new BigDecimal(cartItem.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        order.setTotalAmount(totalAmount);
        order.setQuantity(totalQuantity);
        order.setStatus("формируется");
        order.setCreatedWhen(LocalDateTime.now());

        OrderDTO createdOrder = orderMapper.toDTO(orderRepository.save(order));

        // Clear user's cart after order creation
        cartService.clearUserCart(orderDTO.getUserId());

        // Заполняем информацию о заказчике
        createdOrder.setCustomerFirstName(user.getFirstName());
        createdOrder.setCustomerLastName(user.getLastName());
        createdOrder.setCustomerEmail(user.getEmail());
        createdOrder.setCustomerPhone(user.getPhone());

        return createdOrder;
    }

    @Transactional
    public Page<OrderDTO> getAllUserOrders(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Page<Order> orderPage = orderRepository.findAllByUserId(userId, pageable);
        List<OrderDTO> orderDTOs = orderPage.getContent().stream()
                .map(order -> {
                    Hibernate.initialize(order.getOrderProducts());

                    OrderDTO orderDTO = orderMapper.toDTO(order);

                    // Map OrderProducts to OrderProductDTO
                    List<OrderProductDTO> orderProductDTOs = order.getOrderProducts().stream()
                            .map(orderProduct -> {
                                OrderProductDTO dto = new OrderProductDTO();
                                dto.setProductId(orderProduct.getProduct().getId());
                                dto.setQuantity(orderProduct.getQuantity());
                                return dto;
                            })
                            .collect(Collectors.toList());
                    orderDTO.setOrderProducts(orderProductDTOs);

                    List<ProductDTO> productDTOs = order.getOrderProducts().stream()
                            .map(orderProduct -> {
                                Product product = orderProduct.getProduct();
                                // Ensure all ProductDTO fields are populated

                                ProductDTO productDTO = modelMapper.map(product, ProductDTO.class);
                                Hibernate.initialize(product.getImage());

                                productDTO.setProductName(product.getProductName());
                                productDTO.setPrice(product.getPrice());
                                productDTO.setVideoCard(product.getVideoCard());
                                productDTO.setProcessor(product.getProcessor());
                                productDTO.setRam(product.getRam());
                                productDTO.setStorage(product.getStorage());
                                productDTO.setImage(product.getImage());

                                return productDTO;
                            })
                            .collect(Collectors.toList());
                    orderDTO.setProducts(productDTOs);
                    orderDTO.setQuantity(order.getQuantity());//Добавлено
                    // Заполняем информацию о заказчике
                    orderDTO.setCustomerFirstName(user.getFirstName());
                    orderDTO.setCustomerLastName(user.getLastName());
                    orderDTO.setCustomerEmail(user.getEmail());
                    orderDTO.setCustomerPhone(user.getPhone());

                    return orderDTO;
                })
                .collect(Collectors.toList());

        return new PageImpl<>(orderDTOs, pageable, orderPage.getTotalElements());
    }

    @Transactional
    public Page<OrderDTO> getAllOrders(String status, String customerFirstName, String customerLastName, String customerEmail, String customerPhone, Pageable pageable) {
        Specification<Order> spec = (Root<Order> root, CriteriaQuery<?> query, CriteriaBuilder criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null && !status.isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }
            if (customerFirstName != null && !customerFirstName.isEmpty()) {
                Join<Order, User> userJoin = root.join("user");
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(userJoin.get("firstName")), "%" + customerFirstName.toLowerCase() + "%"));
            }
            if (customerLastName != null && !customerLastName.isEmpty()) {
                Join<Order, User> userJoin = root.join("user");
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(userJoin.get("lastName")), "%" + customerLastName.toLowerCase() + "%"));
            }
            if (customerEmail != null && !customerEmail.isEmpty()) {
                Join<Order, User> userJoin = root.join("user");
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(userJoin.get("email")), "%" + customerEmail.toLowerCase() + "%"));
            }
            if (customerPhone != null && !customerPhone.isEmpty()) {
                Join<Order, User> userJoin = root.join("user");
                predicates.add(criteriaBuilder.like(userJoin.get("phone"), "%" + customerPhone + "%"));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        Page<Order> orderPage = orderRepository.findAll(spec, pageable);

        List<OrderDTO> orderDTOs = orderPage.getContent().stream()
                .map(order -> {
                    Hibernate.initialize(order.getOrderProducts());

                    OrderDTO orderDTO = orderMapper.toDTO(order);
                    User user = order.getUser();

                    List<ProductDTO> productDTOs = order.getOrderProducts().stream()
                            .map(orderProduct -> {
                                Product product = orderProduct.getProduct();

                                ProductDTO productDTO = modelMapper.map(product, ProductDTO.class);
                                Hibernate.initialize(product.getImage());

                                productDTO.setProductName(product.getProductName());
                                productDTO.setPrice(product.getPrice());
                                productDTO.setVideoCard(product.getVideoCard());
                                productDTO.setProcessor(product.getProcessor());
                                productDTO.setRam(product.getRam());
                                productDTO.setStorage(product.getStorage());
                                productDTO.setImage(product.getImage());

                                return productDTO;
                            })
                            .collect(Collectors.toList());
                    orderDTO.setProducts(productDTOs);
                    orderDTO.setQuantity(order.getQuantity());

                    // Заполняем информацию о заказчике
                    orderDTO.setCustomerFirstName(user.getFirstName());
                    orderDTO.setCustomerLastName(user.getLastName());
                    orderDTO.setCustomerEmail(user.getEmail());
                    orderDTO.setCustomerPhone(user.getPhone());

                    return orderDTO;
                })
                .collect(Collectors.toList());
        return new PageImpl<>(orderDTOs, pageable, orderPage.getTotalElements());
    }

    @Transactional
    public OrderDTO updateOrderStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        Hibernate.initialize(order.getOrderProducts()); // Инициализация orderProducts

        order.setStatus(status);
        Order updatedOrder = orderRepository.save(order);

        OrderDTO orderDTO = orderMapper.toDTO(updatedOrder);
        //Убедитесь, что все необходимые поля для DTO заполнены, включая products и другие связанные данные.
        User user = updatedOrder.getUser();
        orderDTO.setCustomerFirstName(user.getFirstName());
        orderDTO.setCustomerLastName(user.getLastName());
        orderDTO.setCustomerEmail(user.getEmail());
        orderDTO.setCustomerPhone(user.getPhone());

        List<ProductDTO> productDTOs = updatedOrder.getOrderProducts().stream()
                .map(orderProduct -> {
                    Product product = orderProduct.getProduct();
                    Hibernate.initialize(product.getImage()); // Инициализация изображения
                    ProductDTO productDTO = modelMapper.map(product, ProductDTO.class);
                    productDTO.setProductName(product.getProductName());
                    productDTO.setPrice(product.getPrice());
                    productDTO.setVideoCard(product.getVideoCard());
                    productDTO.setProcessor(product.getProcessor());
                    productDTO.setRam(product.getRam());
                    productDTO.setStorage(product.getStorage());
                    productDTO.setImage(product.getImage());

                    return productDTO;
                })
                .collect(Collectors.toList());
        orderDTO.setProducts(productDTOs);
        orderDTO.setQuantity(updatedOrder.getQuantity());//Добавлено

        return orderDTO;
    }
}
