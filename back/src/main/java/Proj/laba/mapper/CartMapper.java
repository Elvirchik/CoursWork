package Proj.laba.mapper;

import Proj.laba.dto.CartDTO;
import Proj.laba.model.Cart;
import Proj.laba.model.Product;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
public class CartMapper extends GenericMapper<Cart, CartDTO> {

    private final ModelMapper modelMapper;

    public CartMapper(ModelMapper modelMapper) {
        super(Cart.class, CartDTO.class, modelMapper);
        this.modelMapper = modelMapper;
    }

    @Override
    protected void mapSpecificFields(CartDTO source, Cart destination) {
        // No specific mapping needed from DTO to Entity
    }

    @Override
    protected void mapSpecificFields(Cart source, CartDTO destination) {
        Product product = source.getProduct();
        if (product != null) {
            destination.setProductName(product.getProductName());
            destination.setPrice(product.getPrice());
            destination.setImage(product.getImage());
            destination.setVideoCard(product.getVideoCard());
            destination.setProcessor(product.getProcessor());
            destination.setRam(product.getRam());
            destination.setStorage(product.getStorage());
        }
    }

    @Override
    protected void setupMapper() {
        modelMapper.createTypeMap(Cart.class, CartDTO.class)
                .addMappings(mapper -> {
                    mapper.map(src -> src.getUser().getId(), CartDTO::setUserId);
                    mapper.map(src -> src.getProduct().getId(), CartDTO::setProductId);
                    // Add mappings for product fields
                    mapper.map(src -> src.getProduct().getProductName(), CartDTO::setProductName);
                    mapper.map(src -> src.getProduct().getPrice(), CartDTO::setPrice);
                    mapper.map(src -> src.getProduct().getImage(), CartDTO::setImage);
                    mapper.map(src -> src.getProduct().getVideoCard(), CartDTO::setVideoCard);
                    mapper.map(src -> src.getProduct().getProcessor(), CartDTO::setProcessor);
                    mapper.map(src -> src.getProduct().getRam(), CartDTO::setRam);
                    mapper.map(src -> src.getProduct().getStorage(), CartDTO::setStorage);
                });
    }

    @Override
    protected List<Long> getIds(Cart entity) {
        return Collections.singletonList(entity.getId());
    }
}
