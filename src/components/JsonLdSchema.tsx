
import { Helmet } from "react-helmet-async";

interface JsonLdSchemaProps {
  schema: any | any[];
}

const JsonLdSchema = ({ schema }: JsonLdSchemaProps) => {
  const schemaArray = Array.isArray(schema) ? schema : [schema];
  
  return (
    <Helmet>
      {schemaArray.map((schemaItem, index) => (
        <script 
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaItem) }}
        />
      ))}
    </Helmet>
  );
};

export default JsonLdSchema;
