use Rack::Static,
  :urls => ["/assets/img", "/assets/js", "/assets/css", "/templates"],
  :root => "build",
  :index => 'index.html',
  :header_rules => [[:all, {'Cache-Control' => 'public, max-age=3600'}]]

headers = {'Content-Type' => 'text/html', 'Content-Length' => '9'}
run lambda { |env| [404, headers, ['Not Found']] }