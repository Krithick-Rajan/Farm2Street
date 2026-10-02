package com.farm2street.model;

import java.io.Serializable;

/**
 * Model representing an item in the session shopping cart.
 */
public class CartItem implements Serializable {
    private static final long serialVersionUID = 1L;

    private Produce produce;
    private int quantity;

    public CartItem() {}

    public CartItem(Produce produce, int quantity) {
        this.produce = produce;
        this.quantity = quantity;
    }

    public Produce getProduce() { return produce; }
    public void setProduce(Produce produce) { this.produce = produce; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public double getSubtotal() {
        return produce != null ? produce.getPrice() * quantity : 0.0;
    }
}
