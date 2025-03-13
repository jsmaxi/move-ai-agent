module contract::hello {
    use std::string;
    
    #[view]
    public fun hello(): string::String {
        string::utf8(b"Hello, Move!")
    }
}