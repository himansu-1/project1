public class LinkedList {
    Node head;

    class Node {
        Node next;
        int data;

        Node(int data) {
            this.data = data;
            this.next = null;
        }

        Node(int data, Node next) {
            this.data = data;
            this.next = next;
        }
    }

    public void display() {
        Node current = head;

        if (current == null) {
            System.out.println("This Linked List is empty.");
            return;
        }

        System.out.print("LinkedList printing: ");
        while (current != null) {
            System.out.print(current.data + "->");
            current = current.next;
        }
        System.out.print("\b\b");
    }

    public void insert(int data){
        Node newNode = new Node(data);
        
        if (head == null) {
            head = newNode; 
            return;
        }
        Node current = head;

        while (current.next != null) {
            current = current.next;
        }

        current.next = newNode;
    }

    public static void main(String[] args) {
        LinkedList l1 = new LinkedList();
        
        l1.insert(0);
        l1.insert(1);
        l1.insert(2);
        l1.insert(3);
        l1.display();
    }
}