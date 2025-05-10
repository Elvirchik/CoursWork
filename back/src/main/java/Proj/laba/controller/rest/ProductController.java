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
import java.util.ArrayList;
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

    // Добавляем новый метод для получения товара по ID
    @GetMapping("/getOne")
    public ResponseEntity<ProductDTO> getOne(@RequestParam(value = "id") Long id) {
        ProductDTO product = productService.getOne(id);
        return ResponseEntity.ok(product);
    }

    @PostMapping(value = "/add", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductDTO> createProduct(
            @RequestParam("productName") String productName,
            @RequestParam("price") BigDecimal price,
            @RequestParam("videoCard") String videoCard,
            @RequestParam("processor") String processor,
            @RequestParam("ram") String ram,
            @RequestParam("storage") String storage,
            @RequestParam("image") MultipartFile mainImage,
            @RequestParam(value = "additionalImages", required = false) MultipartFile[] additionalImages,
            @RequestParam(value = "cpufull", required = false) String cpufull,
            @RequestParam(value = "gpufull", required = false) String gpufull,
            @RequestParam(value = "ramfull", required = false) String ramfull,
            @RequestParam(value = "romfull", required = false) String romfull,
            @RequestParam(value = "powerfull", required = false) String powerfull,
            @RequestParam(value = "casefull", required = false) String casefull,
            @RequestParam(value = "coolingCpu", required = false) String coolingCpu) throws IOException {

        ProductDTO productDTO = new ProductDTO();
        productDTO.setProductName(productName);
        productDTO.setPrice(price);
        productDTO.setVideoCard(videoCard);
        productDTO.setProcessor(processor);
        productDTO.setRam(ram);
        productDTO.setStorage(storage);
        productDTO.setImage(mainImage.getBytes());

        // Обработка дополнительных изображений, если они есть
        if (additionalImages != null && additionalImages.length > 0) {
            List<byte[]> additionalImagesList = new ArrayList<>();
            for (MultipartFile file : additionalImages) {
                additionalImagesList.add(file.getBytes());
            }
            productDTO.setAdditionalImages(additionalImagesList);
        }

        productDTO.setCpufull(cpufull);
        productDTO.setGpufull(gpufull);
        productDTO.setRamfull(ramfull);
        productDTO.setRomfull(romfull);
        productDTO.setPowerfull(powerfull);
        productDTO.setCasefull(casefull);
        productDTO.setCoolingCpu(coolingCpu);

        ProductDTO savedProduct = productService.create(productDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedProduct);
    }

    @PutMapping(value = "/update-with-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductDTO> updateProductWithImage(
            @RequestParam("id") Long id,
            @RequestParam("productName") String productName,
            @RequestParam("price") BigDecimal price,
            @RequestParam("videoCard") String videoCard,
            @RequestParam("processor") String processor,
            @RequestParam("ram") String ram,
            @RequestParam("storage") String storage,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "additionalImages", required = false) MultipartFile[] additionalImages,
            @RequestParam(value = "cpufull", required = false) String cpufull,
            @RequestParam(value = "gpufull", required = false) String gpufull,
            @RequestParam(value = "ramfull", required = false) String ramfull,
            @RequestParam(value = "romfull", required = false) String romfull,
            @RequestParam(value = "powerfull", required = false) String powerfull,
            @RequestParam(value = "casefull", required = false) String casefull,
    @RequestParam(value = "coolingCpu", required = false) String coolingCpu) throws IOException {

        ProductDTO existingProduct = productService.getOne(id);
        existingProduct.setProductName(productName);
        existingProduct.setPrice(price);
        existingProduct.setVideoCard(videoCard);
        existingProduct.setProcessor(processor);
        existingProduct.setRam(ram);
        existingProduct.setStorage(storage);
        existingProduct.setCpufull(cpufull);
        existingProduct.setGpufull(gpufull);
        existingProduct.setRamfull(ramfull);
        existingProduct.setRomfull(romfull);
        existingProduct.setPowerfull(powerfull);
        existingProduct.setCasefull(casefull);
        existingProduct.setCoolingCpu(coolingCpu);

        if (image != null && !image.isEmpty()) {
            existingProduct.setImage(image.getBytes());
        }

        if (additionalImages != null && additionalImages.length > 0) {
            boolean hasNonEmptyImages = false;
            for (MultipartFile file : additionalImages) {
                if (file != null && !file.isEmpty()) {
                    hasNonEmptyImages = true;
                    break;
                }
            }

            if (hasNonEmptyImages) {
                List<byte[]> additionalImagesList = new ArrayList<>();
                for (MultipartFile file : additionalImages) {
                    if (file != null && !file.isEmpty()) {
                        additionalImagesList.add(file.getBytes());
                    }
                }

                existingProduct.setAdditionalImages(additionalImagesList);
            }
        }

        ProductDTO updatedProduct = productService.update(existingProduct);
        return ResponseEntity.status(HttpStatus.OK).body(updatedProduct);
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
