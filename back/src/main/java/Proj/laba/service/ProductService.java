package Proj.laba.service;

import Proj.laba.dto.ProductDTO;
import Proj.laba.mapper.ProductMapper;
import Proj.laba.model.Product;
import Proj.laba.reposirory.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

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

    public List<Product> filterProducts(
            BigDecimal minPrice, BigDecimal maxPrice,
            String gpuManufacturer, String gpuModel,
            String cpuLine, String ramSize,
            String minStorage, String maxStorage) {

        List<Product> allProducts = productRepository.findAll();

        return allProducts.stream()
                .filter(product -> {
                    // Фильтр по цене
                    if (minPrice != null && product.getPrice().compareTo(minPrice) < 0) {
                        return false;
                    }
                    if (maxPrice != null && product.getPrice().compareTo(maxPrice) > 0) {
                        return false;
                    }

                    // Фильтр по производителю видеокарты
                    if (gpuManufacturer != null && !gpuManufacturer.isEmpty()) {
                        if ("AMD".equalsIgnoreCase(gpuManufacturer) &&
                                !product.getVideoCard().toUpperCase().contains("AMD") &&
                                !product.getVideoCard().toUpperCase().contains("RADEON")) {
                            return false;
                        }
                        if ("NVIDIA".equalsIgnoreCase(gpuManufacturer) &&
                                !product.getVideoCard().toUpperCase().contains("GEFORCE") &&
                                !product.getVideoCard().toUpperCase().contains("NVIDIA")) {
                            return false;
                        }
                    }

                    // Фильтр по модели видеокарты
                    if (gpuModel != null && !gpuModel.isEmpty() &&
                            !product.getVideoCard().toUpperCase().contains(gpuModel.toUpperCase())) {
                        return false;
                    }

                    // Фильтр по линейке процессоров
                    if (cpuLine != null && !cpuLine.isEmpty()) {
                        if ("Intel".equalsIgnoreCase(cpuLine) &&
                                !product.getProcessor().toUpperCase().contains("INTEL")) {
                            return false;
                        }
                        if ("AMD".equalsIgnoreCase(cpuLine) &&
                                !product.getProcessor().toUpperCase().contains("AMD") &&
                                !product.getProcessor().toUpperCase().contains("RYZEN")) {
                            return false;
                        }
                    }

                    // Фильтр по оперативной памяти
                    if (ramSize != null && !ramSize.isEmpty()) {
                        if (!product.getRam().equals(ramSize)) {
                            return false;
                        }
                    }

                    // Фильтр по постоянной памяти
                    if (minStorage != null && !minStorage.isEmpty()) {
                        try {
                            double storageValue = Double.parseDouble(product.getStorage());
                            double minStorageValue = Double.parseDouble(minStorage);
                            if (storageValue < minStorageValue) {
                                return false;
                            }
                        } catch (NumberFormatException e) {
                            return false;
                        }
                    }

                    if (maxStorage != null && !maxStorage.isEmpty()) {
                        try {
                            double storageValue = Double.parseDouble(product.getStorage());
                            double maxStorageValue = Double.parseDouble(maxStorage);
                            if (storageValue > maxStorageValue) {
                                return false;
                            }
                        } catch (NumberFormatException e) {
                            return false;
                        }
                    }

                    return true;
                })
                .collect(Collectors.toList());
    }

}
