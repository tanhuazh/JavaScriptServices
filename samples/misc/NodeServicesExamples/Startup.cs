using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.NodeServices;
using Microsoft.AspNetCore.NodeServices.HostingModels;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace NodeServicesExamples
{
    public class Startup
    {
        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc();

            // Enable Node Services
            services.AddNodeServices(options =>
            {
                // this is relative to NodeServicesExamples folder
                options.ProjectPath = @"./test";
            });
            services.AddSpaPrerenderer();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, ILoggerFactory loggerFactory, IHostingEnvironment env, INodeServices nodeServices)
        {
            app.UseDeveloperExceptionPage();

            // Dynamically transpile any .js files under the '/js/' directory
            app.Use(next => async context =>
            {
                var requestPath = context.Request.Path.Value;
                if (requestPath.StartsWith("/js/") && requestPath.EndsWith(".js"))
                {
                    var fileInfo = env.WebRootFileProvider.GetFileInfo(requestPath);
                    if (fileInfo.Exists)
                    {
                        var transpiled = await nodeServices.InvokeAsync<string>("./Node/transpilation.js", fileInfo.PhysicalPath, requestPath);
                        await context.Response.WriteAsync(transpiled);
                        return;
                    }
                }

                // Not a JS file, or doesn't exist - let some other middleware handle it
                await next.Invoke(context);
            });

            app.UseStaticFiles();
            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");
            });
        }

        public static void Main(string[] args)
        {
            UnicodeTest().Wait();

            return;

            var host = new WebHostBuilder()
                .ConfigureLogging(factory =>
                {
                    factory.AddConsole();
                    factory.AddDebug();
                })
                .UseContentRoot(Directory.GetCurrentDirectory())
                .UseIISIntegration()
                .UseKestrel()
                .UseStartup<Startup>()
                .Build();

            host.Run();
        }

        public static async Task UnicodeTest()
        {
            var jsonSerializerSettings = new JsonSerializerSettings
            {
                ContractResolver = new CamelCasePropertyNamesContractResolver(),
                TypeNameHandling = TypeNameHandling.None
            };

            var client = new HttpClient();

            NodeInvocationInfo invocationInfo = new NodeInvocationInfo()
            {
                ModuleName = "main",
                ExportedFunctionName = "run",
                Args = new[] { "Super �cran" },
            };

            var payloadJson = JsonConvert.SerializeObject(invocationInfo, jsonSerializerSettings);
            var payload = new StringContent(payloadJson, Encoding.UTF8, "application/json");
            var response = await client.PostAsync("http://localhost:60744", payload);
        }
    }
}
