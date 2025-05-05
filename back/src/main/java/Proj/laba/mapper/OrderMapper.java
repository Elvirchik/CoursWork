package Proj.laba.mapper;

import Proj.laba.dto.OrderDTO;
import Proj.laba.dto.ProductDTO;
import Proj.laba.model.Order;
import Proj.laba.model.Product;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class OrderMapper extends GenericMapper<Order, OrderDTO> {

    private final ModelMapper modelMapper;

    public OrderMapper(ModelMapper modelMapper) {
        super(Order.class, OrderDTO.class, modelMapper);
        this.modelMapper = modelMapper;
    }

    @Override
    protected void mapSpecificFields(OrderDTO source, Order destination) {
    }

    @Override
    protected void mapSpecificFields(Order source, OrderDTO destination) {
        if (source.getUser() != null) {
            destination.setUserId(source.getUser().getId());
            destination.setCustomerFirstName(source.getUser().getFirstName());
            destination.setCustomerLastName(source.getUser().getLastName());
            destination.setCustomerEmail(source.getUser().getEmail());
            destination.setCustomerPhone(source.getUser().getPhone());
        }

        List<ProductDTO> productDTOs = source.getOrderProducts().stream()
                .map(orderProduct -> {
                    Product product = orderProduct.getProduct();
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
        destination.setProducts(productDTOs);
    }


    @Override
    protected void setupMapper() {
        modelMapper.createTypeMap(Order.class, OrderDTO.class)
                .addMappings(mapper -> mapper.skip(OrderDTO::setUserId))
                .addMappings(mapper -> mapper.skip(OrderDTO::setProducts))
                .addMappings(mapper -> mapper.skip(OrderDTO::setCustomerFirstName))
                .addMappings(mapper -> mapper.skip(OrderDTO::setCustomerLastName))
                .addMappings(mapper -> mapper.skip(OrderDTO::setCustomerEmail))
                .addMappings(mapper -> mapper.skip(OrderDTO::setCustomerPhone));

        modelMapper.createTypeMap(OrderDTO.class, Order.class)
                .addMappings(mapper -> mapper.skip(Order::setUser))
                .addMappings(mapper -> mapper.skip(Order::setOrderProducts));
    }

    @Override
    protected List<Long> getIds(Order entity) {
        return null;
    }
}
