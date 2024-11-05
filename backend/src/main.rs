use actix_web::{App, web, HttpServer, Responder, HttpRequest, HttpResponse};
use serde::{Serialize, Deserialize};
use actix_cors::Cors;

#[derive(Serialize, Deserialize)]
struct ApiResponse{
    message : String
}

async fn hello() -> impl Responder{
    let message_response = ApiResponse{
        message : String::from("hello from server")
    };
    return HttpResponse::Ok().json(message_response); //acts a return statement without a semicolon and return keyword
}

#[actix_web::main]
async fn main() -> std::io::Result<()>{
    HttpServer::new(|| {
        App::new()
        .wrap(Cors::default().allowed_origin("http://localhost:3000")
                                .allowed_methods(vec!["GET", "POST","PUT","DELETE"])
                                .allowed_headers(vec!["Content-Type"])) 
        .route("api/hello", web::get().to(hello))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}