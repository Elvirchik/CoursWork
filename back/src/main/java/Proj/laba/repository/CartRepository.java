package Proj.laba.repository;

import Proj.laba.model.Cart;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CartRepository extends GenericRepository<Cart> {
    List<Cart> findAllByUserId(Long userId);
    void deleteAllByUserId(Long userId);
}
