package Proj.laba.controller.rest;

import Proj.laba.dto.ProductDTO;
import Proj.laba.mapper.ProductMapper;
import Proj.laba.model.Product;
import Proj.laba.service.ProductService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/products")
@Tag(name = "Товары", description = "Контроллер для работы с товарами компании")
public class ProductController extends GenericController<Product, ProductDTO> {

    private final ProductService productService;
    private final ProductMapper productMapper;

    public ProductController(ProductService productService, ProductMapper productMapper) {
        super(productService, productMapper);
        this.productService = productService;
        this.productMapper = productMapper;
    }

    // Переопределяем метод getAll, чтобы возвращать только активные товары
    @Override
    @GetMapping("/getAll")
    public ResponseEntity<List<ProductDTO>> getAll() {
        List<ProductDTO> products = productService.listAllActive();
        return ResponseEntity.ok(products);
    }

    @PostMapping(value = "/add", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductDTO> createProduct(
            @RequestParam("productName") String productName,
            @RequestParam("price") BigDecimal price,
            @RequestParam("videoCard") String videoCard,
            @RequestParam("processor") String processor,
            @RequestParam("ram") String ram,
            @RequestParam("storage") String storage,
            @RequestParam("image") MultipartFile image) throws IOException {
        // существующий код
        ProductDTO productDTO = new ProductDTO();
        productDTO.setProductName(productName);
        productDTO.setPrice(price);
        productDTO.setVideoCard(videoCard);
        productDTO.setProcessor(processor);
        productDTO.setRam(ram);
        productDTO.setStorage(storage);
        productDTO.setImage(image.getBytes());

        ProductDTO createdProduct = productService.create(productDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdProduct);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/filter")
    public ResponseEntity<List<Product>> filterProducts(
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String gpuManufacturer,
            @RequestParam(required = false) String gpuModel,
            @RequestParam(required = false) String cpuLine,
            @RequestParam(required = false) String ramSize,
            @RequestParam(required = false) String minStorage,
            @RequestParam(required = false) String maxStorage) {

        List<Product> filteredProducts = productService.filterProducts(
                minPrice, maxPrice, gpuManufacturer, gpuModel,
                cpuLine, ramSize, minStorage, maxStorage);

        return ResponseEntity.ok(filteredProducts);
    }

}
