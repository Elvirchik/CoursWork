package Proj.laba.mapper;

import Proj.laba.dto.ProductDTO;
import Proj.laba.model.Product;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;



@Component
public class ProductMapper extends GenericMapper<Product, ProductDTO> {

    public ProductMapper(ModelMapper modelMapper) {
        super(Product.class, ProductDTO.class, modelMapper);
    }

    @Override
    protected void mapSpecificFields(ProductDTO source, Product destination) {
        // Специфическое мапирование, если необходимо
    }

    @Override
    protected void mapSpecificFields(Product source, ProductDTO destination) {
        // Специфическое мапирование, если необходимо
    }

    @Override
    protected void setupMapper() {
        // Настройка специфического мапирования, если необходимо
    }

    @Override
    protected List<Long> getIds(Product entity) {
        return Collections.singletonList(entity.getId());
    }
}
