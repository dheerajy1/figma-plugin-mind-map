// FigJam Mind Map with beautiful UI
figma.showUI(__html__, { width: 540, height: 800 });

interface TreeNode {
  name: string;
  children?: TreeNode[];
  indent?: number;
  has_last?: boolean;
}

// Listen for UI messages
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'import') {
    try {
      await createMindMap(msg.data);
      figma.notify('Mind map created successfully!');
      figma.closePlugin();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "UnKnown error"
      figma.notify(msg);
      // console.log(error);
    }
  }
};

figma.on('run', async ({ command }: RunEvent) => {
  if (command === 'importMindMap') {
    // UI will show automatically
  }
});

async function createMindMap(data: TreeNode[]) {
  // console.log('Starting mind map creation with', data.length, 'nodes');

  const centerX = figma.viewport.center.x;
  const centerY = figma.viewport.center.y;

  // Layout settings - increased for better spacing
  const nodeWidth = 180;
  const nodeHeight = 80;
  const horizontalSpacing = 200; // Much more space between siblings
  const verticalSpacing = 140;   // Space between parent-child levels

  // Load font
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });

  const colors = [
    { r: 0.95, g: 0.95, b: 0.95 },  // gray - level 0
    { r: 1, g: 0.71, b: 0.76 },     // pink - level 1
    { r: 0.68, g: 0.85, b: 0.9 },   // blue - level 2
    { r: 0.56, g: 0.93, b: 0.56 },  // green - level 3
    { r: 1, g: 0.85, b: 0.73 },     // peach - level 4
    { r: 0.9, g: 0.8, b: 1 },       // purple - level 5
    { r: 1, g: 0.95, b: 0.6 },      // yellow - level 6
  ];

  const allShapes: ShapeWithTextNode[] = [];
  const connectorsToCreate: { parentId: string; childId: string; }[] = [];

  // Create shape
  function createShape(text: string, x: number, y: number, level: number): ShapeWithTextNode {
    const shape = figma.createShapeWithText();
    shape.x = x;
    shape.y = y;
    shape.resize(nodeWidth, nodeHeight);
    shape.fills = [{ type: 'SOLID', color: colors[level % colors.length] }];
    shape.strokes = [{ type: 'SOLID', color: { r: 0.7, g: 0.7, b: 0.7 } }];
    shape.strokeWeight = 2;
    shape.shapeType = 'ROUNDED_RECTANGLE';
    shape.text.characters = text;
    shape.text.fontSize = 14;
    shape.text.fontName = { family: "Inter", style: "Medium" };
    shape.text.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];

    figma.currentPage.appendChild(shape);
    return shape;
  }

  // Calculate subtree width recursively
  function calculateSubtreeWidth(node: TreeNode): number {
    if (!node.children || node.children.length === 0) {
      return nodeWidth;
    }

    let totalChildWidth = 0;
    node.children.forEach((child) => {
      totalChildWidth += calculateSubtreeWidth(child);
    });

    // Add spacing between children
    totalChildWidth += (node.children.length - 1) * horizontalSpacing;

    // Parent needs to be at least as wide as its children
    return Math.max(nodeWidth, totalChildWidth);
  }

  // Recursive layout with proper spacing
  function layoutTree(node: TreeNode, x: number, y: number, level: number): ShapeWithTextNode {
    const shape = createShape(node.name, x, y, level);
    allShapes.push(shape);

    if (node.children && node.children.length > 0) {
      const childY = y + nodeHeight + verticalSpacing;

      // Calculate width needed for each child subtree
      const childWidths: number[] = [];
      let totalChildWidth = 0;

      node.children.forEach((child) => {
        const width = calculateSubtreeWidth(child);
        childWidths.push(width);
        totalChildWidth += width;
      });

      // Add spacing between children
      totalChildWidth += (node.children.length - 1) * horizontalSpacing;

      // Start X position - center children under parent
      let childX = x + (nodeWidth / 2) - (totalChildWidth / 2);

      node.children.forEach((child, index) => {
        const childWidth = childWidths[index];
        // Position child at center of its allocated space
        const childCenterX = childX + (childWidth / 2) - (nodeWidth / 2);

        const childShape = layoutTree(child, childCenterX, childY, level + 1);

        // Store connector info
        connectorsToCreate.push({
          parentId: shape.id,
          childId: childShape.id
        });

        // Move to next child position
        childX += childWidth + horizontalSpacing;
      });
    }

    return shape;
  }

  // Create all shapes first
  if (data && data.length > 0) {
    // Calculate total width needed for all root nodes
    let totalRootWidth = 0;
    const rootWidths: number[] = [];

    data.forEach((rootNode) => {
      const width = calculateSubtreeWidth(rootNode);
      rootWidths.push(width);
      totalRootWidth += width;
    });

    totalRootWidth += (data.length - 1) * horizontalSpacing * 2; // Extra space between root trees

    // Start position - centered
    let rootX = centerX - (totalRootWidth / 2);
    const rootY = centerY - 400;

    data.forEach((rootNode, index) => {
      const rootWidth = rootWidths[index];
      const rootCenterX = rootX + (rootWidth / 2) - (nodeWidth / 2);

      layoutTree(rootNode, rootCenterX, rootY, 0);

      rootX += rootWidth + horizontalSpacing * 2;
    });
  }

  // Create connectors AFTER all shapes exist
  // console.log(`Creating ${connectorsToCreate.length} connectors...`);
  connectorsToCreate.forEach((conn) => {
    const connector = figma.createConnector();
    connector.connectorLineType = 'ELBOWED';

    // Use bottom center of parent and top center of child
    connector.connectorStart = {
      endpointNodeId: conn.parentId,
      magnet: 'BOTTOM'  // Changed from AUTO to BOTTOM
    };
    connector.connectorEnd = {
      endpointNodeId: conn.childId,
      magnet: 'TOP'     // Changed from AUTO to TOP
    };

    connector.strokeWeight = 2;
    connector.strokes = [{ type: 'SOLID', color: { r: 0.6, g: 0.6, b: 0.6 } }];
  });

  // Zoom to fit
  if (allShapes.length > 0) {
    figma.viewport.scrollAndZoomIntoView(allShapes);
  }

  figma.notify(`Done: ${allShapes.length} shapes and ${connectorsToCreate.length} connectors`);

  // console.log(`Done: ${allShapes.length} shapes and ${connectorsToCreate.length} connectors`);
}