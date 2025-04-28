package Proj.laba.mapper;

import Proj.laba.dto.ServiceOrderDTO;
import Proj.laba.model.ServiceOrder;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
public class ServiceOrderMapper extends GenericMapper<ServiceOrder, ServiceOrderDTO> {

    public ServiceOrderMapper(ModelMapper modelMapper) {
        super(ServiceOrder.class, ServiceOrderDTO.class, modelMapper);
    }

    @Override
    protected void mapSpecificFields(ServiceOrderDTO source, ServiceOrder destination) {
        destination.setComment(source.getComment()); // Добавляем отображение для comment
    }

    @Override
    protected void mapSpecificFields(ServiceOrder source, ServiceOrderDTO destination) {
        destination.setComment(source.getComment()); // Добавляем отображение для comment
    }

    @Override
    protected void setupMapper() {
        modelMapper.createTypeMap(ServiceOrder.class, ServiceOrderDTO.class)
                .addMappings(mapper -> {
                    mapper.map(src -> src.getUser().getId(), ServiceOrderDTO::setUserId);
                    mapper.map(src -> src.getService().getId(), ServiceOrderDTO::setServiceId);
                    mapper.map(ServiceOrder::getComment, ServiceOrderDTO::setComment); // Добавляем отображение для comment
                });
        modelMapper.createTypeMap(ServiceOrderDTO.class, ServiceOrder.class)
                .addMappings(mapper -> mapper.skip(ServiceOrder::setUser))
                .addMappings(mapper -> mapper.skip(ServiceOrder::setService))
                .addMappings(mapper -> mapper.map(ServiceOrderDTO::getComment, ServiceOrder::setComment)); // Добавляем отображение для comment
    }

    @Override
    protected List<Long> getIds(ServiceOrder entity) {
        return Collections.singletonList(entity.getId());
    }
}
