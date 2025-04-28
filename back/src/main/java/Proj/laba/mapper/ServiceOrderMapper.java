package Proj.laba.mapper;

import Proj.laba.dto.ServiceOrderDTO;
import Proj.laba.model.ServiceOrder;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
public class ServiceOrderMapper extends GenericMapper<ServiceOrder, ServiceOrderDTO> {

    private final ModelMapper modelMapper;

    public ServiceOrderMapper(ModelMapper modelMapper) {
        super(ServiceOrder.class, ServiceOrderDTO.class, modelMapper);
        this.modelMapper = modelMapper;
    }

    @Override
    protected void mapSpecificFields(ServiceOrderDTO source, ServiceOrder destination) {
        // Маппинг из DTO в Entity, если нужен специфический код
    }

    @Override
    protected void mapSpecificFields(ServiceOrder source, ServiceOrderDTO destination) {
        // Маппинг из Entity в DTO
        if (source.getService() != null) {
            destination.setServiceName(source.getService().getServiceName());
        }

        if (source.getUser() != null) {
            destination.setUserFirstName(source.getUser().getFirstName());
            destination.setUserLastName(source.getUser().getLastName());
        }
    }

    @Override
    protected void setupMapper() {
        modelMapper.createTypeMap(ServiceOrder.class, ServiceOrderDTO.class)
                .addMappings(mapper -> {
                    mapper.map(src -> src.getUser().getId(), ServiceOrderDTO::setUserId);
                    mapper.map(src -> src.getService().getId(), ServiceOrderDTO::setServiceId);
                    // Маппинг названия услуги
                    mapper.map(src -> src.getService().getServiceName(), ServiceOrderDTO::setServiceName);
                    // Маппинг имени и фамилии пользователя
                    mapper.map(src -> src.getUser().getFirstName(), ServiceOrderDTO::setUserFirstName);
                    mapper.map(src -> src.getUser().getLastName(), ServiceOrderDTO::setUserLastName);
                });
    }

    @Override
    protected List<Long> getIds(ServiceOrder entity) {
        return Collections.singletonList(entity.getId());
    }
}
