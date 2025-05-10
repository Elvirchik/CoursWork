package Proj.laba.repository;

import Proj.laba.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends GenericRepository<Order> , JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {

    List<Order> findAllByUserId(Long userId);
    Page<Order> findAllByUserId(Long userId, Pageable pageable);
    Page<Order> findAll(Pageable pageable);
}
