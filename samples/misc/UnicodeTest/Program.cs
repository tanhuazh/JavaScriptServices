using System;

namespace UnicodeTest
{
    class Program
    {
        private static readonly JsonSerializerSettings jsonSerializerSettings = new JsonSerializerSettings
        {
            ContractResolver = new CamelCasePropertyNamesContractResolver(),
            TypeNameHandling = TypeNameHandling.None
        };

        static void Main(string[] args)
        {
            Console.WriteLine("Hello World!");
        }
    }
}
