require 'socket'

server = TCPServer.new('127.0.0.1', 4567)
puts "Custom server listening on http://localhost:4567"

loop do
  Thread.start(server.accept) do |client|
    begin
      req_line = client.gets
      content = File.read('/Users/yagneshsuthar/.gemini/antigravity/scratch/semantic-lens/index.html')
      headers = [
        "HTTP/1.1 200 OK",
        "Content-Type: text/html; charset=utf-8",
        "Content-Length: #{content.bytesize}",
        "Connection: close",
        "Access-Control-Allow-Origin: *"
      ].join("\r\n") + "\r\n\r\n"
      
      client.write(headers)
      client.write(content)
    rescue => e
      puts "Error: #{e}"
    ensure
      client.close
    end
  end
end
