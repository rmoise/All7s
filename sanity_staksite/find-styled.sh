#!/bin/bash

echo "Searching for styled-components usage in node_modules/sanity..."
find node_modules/sanity -type f -exec grep -l "styled-components" {} \;

echo -e "\nSearching for styled-components usage in node_modules/@sanity..."
find node_modules/@sanity -type f -exec grep -l "styled-components" {} \;
