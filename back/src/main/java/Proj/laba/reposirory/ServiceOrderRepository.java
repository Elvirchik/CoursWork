package Proj.laba.reposirory;

import Proj.laba.model.ServiceOrder;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ServiceOrderRepository extends GenericRepository<ServiceOrder> {
    List<ServiceOrder> findAllByUserId(Long userId);
}
