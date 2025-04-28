package Proj.laba.service;

import Proj.laba.dto.ProductDTO;
import Proj.laba.mapper.ProductMapper;
import Proj.laba.model.Product;
import Proj.laba.reposirory.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProductService extends GenericService<Product, ProductDTO> {
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    @Autowired
    public ProductService(ProductRepository productRepository, ProductMapper productMapper) {
        super(productRepository, productMapper);
        this.productRepository = productRepository;
        this.productMapper = productMapper;
    }

    // Переименованный метод для прямого получения продукта по ID
    public Product findProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }

    // Переопределяем метод delete для использования мягкого удаления
    @Override
    @Transactional
    public void delete(Long id) {
        // Сначала получаем товар, чтобы задать метаданные удаления
        Product product = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Товар с ID " + id + " не найден"));

        // Устанавливаем метаданные удаления
        product.setDeleted(true);
        product.setDeletedWhen(LocalDateTime.now());
        product.setDeletedBy("admin"); // или текущий пользователь из контекста безопасности

        // Сохраняем изменения
        repository.save(product);
    }

    // Метод для получения только активных (не удаленных) товаров
    @Transactional(readOnly = true)
    public List<ProductDTO> listAllActive() {
        List<Product> products = productRepository.findAllActive();
        return mapper.toDTOs(products);
    }
}
