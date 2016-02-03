use Rack::Auth::Digest::MD5, "Restricted Area", ENV['AUTH_OPAQUE'] do |username|
  {ENV['AUTH_USER'] => ENV['AUTH_PASS']}[username]
end

use Rack::Static,
  :urls => ["/assets/img", "/assets/js", "/assets/css", "/templates", "/partials", "/partials/inbox"],
  :root => "build",
  :index => 'index.html',
  :header_rules => [[:all, {'Cache-Control' => 'public, max-age=3600'}]]


headers = {'Content-Type' => 'text/html', 'Content-Length' => '9'}
run lambda { |env| [404, headers, ['Not Found']] }
